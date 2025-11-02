export const makeContactId = (uidA: string, uidB: string) => {
    return uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`
}