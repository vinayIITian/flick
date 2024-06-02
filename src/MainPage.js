import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, FlatList } from 'react-native';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import selfie3 from '../assets/Selfie3.jpeg';
import selfie2 from '../assets/Selfie2.jpeg';
import selfie1 from '../assets/Selfie1.jpeg';
import downloadIcon from '../assets/download.jpg';
import downloadedIcon from '../assets/downloaded.jpg';

const MainPage = () => {
    const [loading, setLoading] = useState({}); // Use an object to track loading state for each item
    const [downloaded, setDownloaded] = useState({}); // Use an object to track downloaded items

    const data = [
        {
            id: '1',
            videoUri: 'https://t9002190637.p.clickup-attachments.com/t9002190637/bdfc6de9-f429-4ec3-ab3e-3e134b9d3a0b/Video1.mp4?open=true',
            imageUri: selfie1,
        },
        {
            id: '2',
            videoUri: 'https://t9002190637.p.clickup-attachments.com/t9002190637/88dce6af-7e52-49e4-aa34-a153b250f847/Video2.mp4?open=true',
            imageUri: selfie2,
        },
        {
            id: '3',
            videoUri: 'https://t9002190637.p.clickup-attachments.com/t9002190637/77be821b-f700-427f-98fb-575887c691ee/Video3.mp4?open=true',
            imageUri: selfie3,
        },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.mediaContainer}>
            <Video
                source={{ uri: item.videoUri }}
                style={styles.video}
                useNativeControls
            />
            <View style={styles.imageContainer}>
                <Image source={item.imageUri} style={styles.image} />
                <TouchableOpacity onPress={() => handleDownload(item)} style={styles.downloadButton}>
                    {loading[item.id] ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Image
                            source={downloaded[item.id] ? downloadedIcon : downloadIcon}
                            style={styles.downloadIcon}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const handleDownload = async (item) => {
        setLoading(prevState => ({ ...prevState, [item.id]: true }));
    
        const { videoUri, imageUri } = item;
    
        const videoPath = `${FileSystem.documentDirectory}video_${item.id}.mp4`;
        const imagePath = `${FileSystem.documentDirectory}image_${item.id}.jpg`;
        const outputPath = `${FileSystem.documentDirectory}output_${item.id}.mp4`;
    
        try {
            // Download the video and image files if they do not already exist
            await Promise.all([
                FileSystem.downloadAsync(videoUri, videoPath),
                FileSystem.downloadAsync(imageUri, imagePath)
            ]);
            if (typeof outputPath !== 'string') {
                throw new Error('outputPath must be a string');
              }
            // Use FFmpeg to overlay the image on the video
            const ffmpegCommand = `-i ${videoPath} -i ${imagePath} -filter_complex "[1][0]scale2ref=w=iw:h=ih[img][vid];[vid][img]overlay=W-w:H-h" ${outputPath}`;
            console.log('ffmpegCommand:', ffmpegCommand);
    
            const session = await FFmpegKit.executeAsync(ffmpegCommand);
            const returnCode = await session.getReturnCode();
            if (returnCode.isSuccess()) {
                console.log('FFmpeg command executed successfully.');
    
                // Save output to gallery
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    await MediaLibrary.createAssetAsync(outputPath);
                    setDownloaded(prevState => ({ ...prevState, [item.id]: true }));
                    Alert.alert('Success', 'Video downloaded and saved to gallery!');
                } else {
                    Alert.alert('Error', 'Permission to access media library is required.');
                }
            } else {
                const output = await session.getOutput();
                console.error('FFmpeg command failed with return code:', returnCode);
                console.error('FFmpeg output:', output);
                Alert.alert('Error', 'FFmpeg command failed.');
            }
        } catch (error) {
            console.error('Error in handleDownload:', error);
            Alert.alert('Error', `An error occurred while downloading the video: ${error.message}`);
        } finally {
            setLoading(prevState => ({ ...prevState, [item.id]: false }));
        }
    };
    
    

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    mediaContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    video: {
        width: 150,
        height: 250,
        marginRight: 10,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
    },
    downloadButton: {
        position: 'absolute',
        bottom: 5,
        right: 15,
        padding: 5,
        backgroundColor: '#007bff',
        borderRadius: 20,
        alignItems: 'center',
    },
    downloadIcon: {
        width: 20,
        height: 20,
    },
});

export default MainPage;
