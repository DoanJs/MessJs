import { collection, query } from '@react-native-firebase/firestore';
import { db } from '../../../../firebase.config';

export const query_fields = query(collection(db, 'fields'));
export const query_targets = query(collection(db, 'targets'));
export const query_suggests = query(collection(db, 'suggests'));
export const query_children = query(collection(db, 'children'));
export const query_interventions = query(collection(db, 'interventions'));
