import { collection, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { Image as ImageIcon } from 'iconsax-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../../firebase.config';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { getSignedUrl } from '../../constants/functions';
import { sizes } from '../../constants/sizes';
import { useChatStore } from '../../zustand/useChatStore';

const MediaRoomScreen = ({ route }: any) => {
  const { chatRoomId } = route.params;
  const userCurrent = auth.currentUser
  const { messagesByRoom, pendingMessages } = useChatStore();
  const [userMessageState, setUserMessageState] = useState<any>();
  const messages = [
    ...(messagesByRoom[chatRoomId] || []),
    ...(pendingMessages[chatRoomId] || []),
  ]
  const [type, setType] = useState('image');
  const [media, setMedia] = useState<any[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<any>([]);


  useEffect(() => {
    if (!chatRoomId) return;

    const unsub = onSnapshot(
      query(
        collection(db, 'chatRooms', chatRoomId, 'media'),
        orderBy('createAt', 'asc'),
      ),
      snap => {
        setMedia(
          snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          })),
        );
      },
    );

    return unsub;
  }, [chatRoomId]);

  useEffect(() => {
    if (!media?.length) return;

    const needSign = media.some(m => !m.localURL && m.mediaURL && !m.signed);
    if (!needSign) return;

    preloadSignedUrls();
  }, [media]);

  useEffect(() => {
    // listen myReaction
    if (!chatRoomId || !userCurrent) return;

    const userMessageStateRef = collection(
      db,
      `chatRooms/${chatRoomId}/userMessageState/${userCurrent.uid}/messages`,
    );

    const unsub = onSnapshot(userMessageStateRef, docSnap => {
      let state: any = {};
      docSnap.forEach((doc: any) => {
        state[doc.id] = doc.data(); // messageId → { deleted: true }
      });
      setUserMessageState(state);
    });

    return () => {
      unsub();
    };
  }, [chatRoomId, userCurrent?.uid]);

  const enhancedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      return {
        ...msg,
        hiddenMsg:
          userMessageState && userMessageState[msg.id]
            ? userMessageState[msg.id].deleted
            : false,
      };
    });
  }, [messages]);

  const preloadSignedUrls = async () => {
    const results = await Promise.all(
      media.map(async item => {
        if (item.localURL || item.signed || !item.mediaURL) {
          return item;
        }

        const signed = await getSignedUrl(item.mediaURL);

        return {
          ...item,
          mediaURL: signed,
          signed: true,
        };
      }),
    );
    setMedia(results)
  };
  const openViewer = async (mediaId: string) => {
    const imageMessages = media.filter(m => m.type === 'image');

    const keys = imageMessages.map(_ => _.id);
    const uris = imageMessages.map(_ => _.mediaURL);
    const allImages = uris.map(m => ({ uri: m }));
    const index = keys.indexOf(mediaId);

    setImageIndex(index);
    setViewerImages(allImages);
    setViewerVisible(true);
  };
  const showData = () => {
    let hideMsgIds: any[] = []
    enhancedMessages.map((_) => {
      if(_.deleted || _.hiddenMsg){
        hideMsgIds.push(_.id)
      }
    })
    return media.filter((_) => !hideMsgIds.includes(_.id))
  }

  if (!chatRoomId) return <ActivityIndicator />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        back
        bg={colors.primaryLight}
        headerStyle={{ alignItems: 'flex-start' }}
        title={
          <RowComponent styles={{ flex: 1 }} justify="center">
            <ImageIcon
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
            />
            <SpaceComponent width={16} />
            <TextComponent
              text="Ảnh, video, file, link nhóm"
              color={colors.background}
              font={fontFamillies.poppinsBold}
            />
            <SpaceComponent width={16} />
            <ImageIcon
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
            />
          </RowComponent>
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
          }}
        >
          <RowComponent
            justify="space-around"
            styles={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gray2,
              paddingVertical: 10,
            }}
          >
            {[
              { type: 'image', title: 'Ảnh' },
              { type: 'File', title: 'File' },
              { type: 'Link', title: 'Link' }
            ].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setType(_.type)}
                style={{
                  backgroundColor:
                    type === _.type ? colors.primaryDark : colors.background,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <TextComponent
                  text={`${_.title} (${media?.filter((f => f.type === _.type)).length})`}
                  color={type === _.type ? colors.background : colors.textBold}
                  styles={{ fontStyle: 'italic' }}
                />
              </TouchableOpacity>
            ))}
          </RowComponent>

          <SpaceComponent height={10} />
          {
            type === 'image' &&
            <ScrollView showsVerticalScrollIndicator={false}>
              <RowComponent
                styles={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
                justify="flex-start"
              >
                {showData().map((_, index) => {
                  if (_.deleted) return

                  return <TouchableOpacity
                    onPress={() => openViewer(_.id)}
                    key={index}
                    style={{
                      width: '30%',
                      marginHorizontal: '1.5%',
                      marginVertical: '1.5%',
                    }}
                  >
                    <Image
                      source={{
                        uri: _.mediaURL ?? 'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
                      }}
                      style={{
                        resizeMode: 'cover',
                        borderRadius: 10,
                        height: 120,
                        width: 120,
                      }}
                    />
                  </TouchableOpacity>
                })}
              </RowComponent>
            </ScrollView>
          }
        </SectionComponent>

        <ImageViewing
          imageIndex={imageIndex}
          visible={viewerVisible}
          images={viewerImages}
          onRequestClose={() => setViewerVisible(false)}
          animationType="fade"
        />

      </Container>
    </SafeAreaView>
  );
};

export default MediaRoomScreen;