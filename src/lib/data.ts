import { Invoice } from "./types";
import { supabase } from "./supabaseClient";

export const pastInvoices: Invoice[] = [];

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        snakeToCamel(value),
      ])
    );
  }
  return obj;
}
function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([A-Z])/g, "_$1").toLowerCase(),
        camelToSnake(value),
      ])
    );
  }
  return obj;
}
export async function getPastInvoices() {
  const { data, error } = await supabase.from("invoices").select("*");
  const modifiedData = snakeToCamel(data);
  if (!error) {
    return { message: true, data: modifiedData };
  }
  console.log(error);
  return { message: false, data: error };
}

export async function createInvoice(payload: any | null) {
  const modifiedData = camelToSnake(payload);
  console.log(modifiedData);
  const { data, error } = await supabase.from("invoices").insert(modifiedData);
  if (!error) {
    return true;
  }
  console.log(error);
  return false;
}
