import { useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { InputComponent } from '.';
import { ChatRoomModel, UserModel } from '../models';
// import {
//   ChildrenModel,
//   PlanModel,
//   ReportModel,
//   SuggestModel,
//   TargetModel,
// } from '../models';

interface Props {
  placeholder: string;
  type?: string;
  width?: number | string;
  arrSource: any;
  // | TargetModel[]
  // | ChildrenModel[]
  // | PlanModel[]
  // | SuggestModel[]
  // | ReportModel[];
  styles?: StyleProp<ViewStyle>;
  onChange: (val: any) => void;
}

export default function SearchComponent(props: Props) {
  const { placeholder, type, arrSource, styles, onChange, width } = props;
  const [value, setValue] = useState('');

  useEffect(() => {
    let items: any = [];
    switch (type) {
      case 'chatRoom':
        items = (arrSource as any[]).filter(
          _ =>
            _.displayName?.toLowerCase().includes(value.toLowerCase()) ||
            _.name?.toLowerCase().includes(value.toLowerCase()),
        );
        break;
      case 'user':
        items = (arrSource as UserModel[]).filter(
          user =>
            user.displayName?.toLowerCase().includes(value.toLowerCase()) ||
            user.email?.toLowerCase().includes(value.toLowerCase()),
        );
        break;
      case 'searchScreen':
        items = (arrSource).filter((_: any) =>
          _.displayName?.toLowerCase().includes(value.toLowerCase()) ||
          _.name?.toLowerCase().includes(value.toLowerCase())
        );
        break;
      case 'searchSuggest':
        // items = (arrSource as SuggestModel[]).filter(suggest =>
        //   suggest.name.toLowerCase().includes(value.toLowerCase()),
        // );
        break;
      case 'searchReport':
        // items = (arrSource as ReportModel[]).filter(report =>
        //   report.title.toLowerCase().includes(value.toLowerCase()),
        // );
        break;
      //   case "searchTeacher":
      //     items = (arrSource as UserModel[]).filter((teacher) =>
      //       teacher.fullName.toLowerCase().includes(value.toLowerCase())
      //     );
      //     break;
      //   case "searchMeta":
      //     items = (arrSource as any[]).filter((meta) =>
      //       meta.id.toLowerCase().includes(value.toLowerCase())
      //     );
      //     break;

      default:
        break;
    }

    onChange(items);
  }, [value]);

  return (
    <View style={styles}>
      <InputComponent
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        allowClear
      />
    </View>
  );
}
