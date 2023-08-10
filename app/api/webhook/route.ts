import mercadopago, { payment } from "mercadopago";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3001",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return new NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request, res: Response) {
	const access_token = process.env.MP_ACCESS_TOKEN!;
	mercadopago.configure({
		access_token: access_token,
	});

	try {
		// Obtén los parámetros de la consulta
		const paymentId = req.query["data.id"] as string;
		const type = req.query["type"] as string;

		if (type === "payment" && paymentId) {
			// Si el tipo es "payment" y hay un ID de pago
			const data = await mercadopago.payment.findById(paymentId);
			console.log("Payment data:", data);
			console.log("Webhook data:", JSON.stringify(data, null, 2));

			if (data.status === "approved") {
				const orderId = data.external_reference as string;
				console.log("Updating order with ID:", orderId);

				// Actualiza la orden en tu sistema
				const updateResult = await prismadb.order.update({
					where: {
						id: orderId,
					},
					data: {
						isPaid: true,
					},
				});

				console.log("Order update result:", updateResult);
				console.log("Order updated successfully.");
			}
		}

		return new NextResponse(null, { status: 200, headers: corsHeaders });
	} catch (error) {
		console.error("Error processing MercadoPago webhook:", error);
		return new NextResponse("Something went wrong", {
			status: 500,
			headers: corsHeaders,
		});
	}
}
