import { collection, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { Image as ImageIcon } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../firebase.config';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { getSignedUrl } from '../../constants/functions';
import ImageViewing from 'react-native-image-viewing';

const MediaRoomScreen = ({ route }: any) => {
  const { chatRoomId } = route.params;
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

    setMedia(results);
  };

  const openViewer = async (mediaId: string) => {
    const imageMessages = media.filter(m => m.type === 'image');
    // const keys = imageMessages.map(_ => _.mediaURL);
    // const promiseItems = imageMessages.map(
    //   async _ => await getSignedUrl(_.mediaURL),
    // );
    // const uris = await Promise.all(promiseItems);
    const keys = imageMessages.map(_ => _.id);
    const uris = imageMessages.map(_ => _.mediaURL);
    const allImages = uris.map(m => ({ uri: m }));
    const index = keys.indexOf(mediaId);

    setImageIndex(index);
    setViewerImages(allImages);
    setViewerVisible(true);
  };

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
              text="Ảnh, file, link nhóm"
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
              { type: 'video', title: 'video' },
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
                {media.map((_, index) => (
                  <TouchableOpacity
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
                ))}
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

        {/* <SpinnerComponent loading={false} /> */}
      </Container>

      {/* <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
      /> */}
    </SafeAreaView>
  );
};

export default MediaRoomScreen;
