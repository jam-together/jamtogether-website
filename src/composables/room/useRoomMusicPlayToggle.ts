import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref } from 'vue'

export default function useRoomMusicPlayToggle() {

  const isMusicPlayed = ref(true);
  const {handleRequest} = useAPIRequest({ method: "POST" });

  const setPlayed = (played: boolean): void => {
    isMusicPlayed.value = played;
  }

  const togglePlay = async (roomId: string) => {
    await handleRequest({
      endpoint: "/rooms/actions/"+roomId+"/"+(isMusicPlayed.value ? "pause" : "play")
    });
    isMusicPlayed.value = !isMusicPlayed.value;
  }

  return {
    isMusicPlayed,
    togglePlay,
    setPlayed
  }

}
