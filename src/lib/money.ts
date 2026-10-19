/** All money is integer UGX; formatting is the only place it becomes text. */
export function formatUgx(amount: number) {
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`
}
