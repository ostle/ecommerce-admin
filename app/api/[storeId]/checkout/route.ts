import mercadopago from "mercadopago";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3001",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

interface LineItem {
	title: string;
	unit_price: number;
	currency_id: any;
	quantity: number;
}

export async function POST(
	req: Request,
	{ params }: { params: { storeId: string } }
) {
	const access_token = process.env.MP_ACCESS_TOKEN!;
	mercadopago.configure({
		access_token: access_token,
	});

	const { productIds } = await req.json();

	if (!productIds || productIds.length === 0) {
		return new NextResponse("Product ids are required", { status: 400 });
	}

	const products = await prismadb.product.findMany({
		where: {
			id: {
				in: productIds,
			},
		},
	});

	const line_items: LineItem[] = products.map((product) => ({
		title: product.name,
		unit_price: product.price.toNumber(),
		currency_id: "ARS",
		quantity: 1,
	}));

	try {
		const order = await prismadb.order.create({
			data: {
				storeId: params.storeId,
				isPaid: false,
				orderItems: {
					create: productIds.map((productId: string) => ({
						product: {
							connect: {
								id: productId,
							},
						},
					})),
				},
			},
		});

		const orderId = order.id;

		const result = await mercadopago.preferences.create({
			items: line_items,
			notification_url: `${process.env.HTTPS_LOCALHOST_3000}/api/webhook`,
			back_urls: {
				success: "http://localhost:3001/cart?success=1",
				failure: "http://localhost:3001/cart?canceled=1",
			},
			external_reference: orderId,
		} as any);

		const initPoint = result.body.init_point;

		return NextResponse.json(
			{ url: initPoint },
			{
				headers: corsHeaders,
			}
		);
	} catch (error) {
		console.error("Error creating MercadoPago preference:", error);
		return new NextResponse(
			"Something went wrong. Please try again later.",
			{
				status: 500,
			}
		);
	}
}
