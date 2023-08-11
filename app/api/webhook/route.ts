import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mercadopago from "mercadopago";
import prismadb from "@/lib/prismadb";

// const corsHeaders = {
// 	"Access-Control-Allow-Origin": "http://localhost:3001",
// 	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
// 	"Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
// 	return NextResponse.json({}, { headers: corsHeaders });
// }

export async function POST(req: Request) {
	const access_token = process.env.MP_ACCESS_TOKEN!;
	mercadopago.configure({
		access_token: access_token,
	});

	try {
		const body = await req.json();
		if (body.type === "payment") {
			const dataId = body.data.id;
			const paymentInfo = await mercadopago.payment.findById(dataId);

			// Obtener el estado y la referencia externa
			console.log(paymentInfo);
			const status = paymentInfo.body.status;
			const externalReference = paymentInfo.body.external_reference;

			console.log("status:", status);
			console.log("external_reference:", externalReference);

			if (status === "approved") {
				const order = await prismadb.order.update({
					where: {
						id: externalReference, // Usar la referencia externa como ID
					},
					data: {
						isPaid: true,
					},
					include: {
						orderItems: true,
					},
				});
			}
		}

		return new NextResponse(null, { status: 204 });
	} catch (error: any) {
		return new NextResponse(`Webhook Error: ${error.message}`, {
			status: 400,
		});
	}
}
