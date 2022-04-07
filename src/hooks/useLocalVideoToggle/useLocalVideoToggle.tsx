import { LocalVideoTrack } from 'twilio-video';
import { useCallback, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalVideoToggle() {
  const { room, localTracks, getLocalVideoTrack, removeLocalVideoTrack, onError } = useVideoContext();
  const localParticipant = room?.localParticipant;
  const videoTrack = localTracks.find(
    track => !track.name.includes('screen') && track.kind === 'video'
  ) as LocalVideoTrack;
  const [isPublishing, setIspublishing] = useState(false);

  const toggleVideoEnabled = useCallback(() => {
    if (!isPublishing) {
      if (videoTrack) {
        // stop track
        videoTrack.stop();

        // postpone track unpublishing
        setTimeout(() => {
          const localTrackPublication = localParticipant?.unpublishTrack(videoTrack);
          // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
          localParticipant?.emit('trackUnpublished', localTrackPublication);
        }, 1000);

        removeLocalVideoTrack();
      } else {
        setIspublishing(true);
        getLocalVideoTrack()
          .then((track: LocalVideoTrack) => localParticipant?.publishTrack(track, { priority: 'low' }))
          .catch(onError)
          .finally(() => {
            setIspublishing(false);
          });
      }
    }
  }, [videoTrack, localParticipant, getLocalVideoTrack, isPublishing, onError, removeLocalVideoTrack]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
