import { doc, serverTimestamp, updateDoc } from "@react-native-firebase/firestore";
import { db } from "../../../firebase.config";

export const updateDocData = async ({
  nameCollect,
  id,
  valueUpdate,
  metaDoc,
}: {
  nameCollect: string;
  id: string;
  valueUpdate: any;
  metaDoc: string;
}) => {
  await updateDoc(
    doc(db, nameCollect, id),
    { ...valueUpdate, updateAt: serverTimestamp() }
  );
  await updateDoc(doc(db, "Meta", metaDoc), {
    lastUpdated: serverTimestamp(),
  });
};
