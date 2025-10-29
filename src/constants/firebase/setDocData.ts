import { doc, setDoc } from "@react-native-firebase/firestore";
import { db } from "../../../firebase.config";

export const setDocData = async ({
    nameCollect,
    id,
    valueUpdate
}: {
    nameCollect: string,
    id: string
    valueUpdate: any
}) => await setDoc(doc(db, nameCollect, id), valueUpdate,
    { merge: true })