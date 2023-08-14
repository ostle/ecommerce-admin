import { CreditCardIcon, DollarSign, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { formatter } from "@/lib/utils";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getSalesCount } from "@/actions/get-sales-count";
import { getStockCount } from "@/actions/get-stock-count";
import { Overview } from "@/components/overview";
import { getGraphRevenue } from "@/actions/get-graph-revenue";

interface DashboardPageProps {
	params: { storeId: string };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
	const totalRevenue = await getTotalRevenue(params.storeId);
	const salesCount = await getSalesCount(params.storeId);
	const stockCount = await getStockCount(params.storeId);
	const graphRevenue = await getGraphRevenue(params.storeId);

	return (
		<div className='flex-col'>
			<div className='flex-1 space-y-4 p-8 pt-6'>
				<Heading
					title='Dashboard'
					description='Overview of your store'
				/>
				<Separator />
				<div className='grid gap-4 grid-cols-3'>
					<Card>
						<CardHeader className='flex flex-row items-center  space-y-0 pb-2'>
							<DollarSign className='h-4 w-4 text-muted-foreground mr-4 t' />
							<CardTitle className='text-lg font-medium'>
								Total Revenue
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold justify-center'>
								{formatter.format(totalRevenue)}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center  space-y-0  pb-2'>
							<CreditCardIcon className='h-4 w-4 text-muted-foreground mr-4' />
							<CardTitle className='text-lg font-medium '>
								Sales
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold justify-center'>
								+{salesCount}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center space-y-0  pb-2'>
							<Package className='h-4 w-4 text-muted-foreground mr-4' />
							<CardTitle className='text-lg font-medium'>
								Products In Stock
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold justify-center'>
								{stockCount}
							</div>
						</CardContent>
					</Card>
				</div>
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent className='pl-2'>
						<Overview data={graphRevenue} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default DashboardPage;
