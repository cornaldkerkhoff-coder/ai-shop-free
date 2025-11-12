export function formatMoney(cents:number, currency="EUR"){
  return new Intl.NumberFormat("nl-NL",{style:"currency",currency}).format((cents||0)/100);
}