export default function ThankYou({ searchParams }:{ searchParams: { order?: string }}){
  return (
    <div className="p-8 rounded-2xl bg-white border">
      <h1 className="text-2xl font-bold">Bedankt!</h1>
      <p className="mt-2 text-gray-700">Je test-order is geregistreerd (tijdelijk). Order-ID: <span className="font-mono">{searchParams.order || "onbekend"}</span></p>
    </div>
  );
}