import { ImportForm } from "./import-form";

export default function ImportarPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Importar CSV</h1>
      <ImportForm />
    </div>
  );
}
