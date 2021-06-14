import { createContext, useState, ReactNode, useContext } from 'react';
import Episode from '../pages/episodes/[slug]';

type PlayerContextProviderProps = {
	children: ReactNode;
};

type Episode = {
	title: string;
	members: string;
	thumbnail: string;
	duration: number;
	url: string;
};

type PlayerContextProps = {
	episodeList: Episode[];
	currentEpisodeIndex: number;
	isLooping: boolean;
	isPlaying: boolean;
	isShuffling: boolean;
	hasPrev: boolean;
	hasNext: boolean;
	playList: (episode: Episode[], index: number) => void;
	play: (episode: Episode) => void;
	playNext: () => void;
	playPrevious: () => void;
	switchPlay: () => void;
	switchLoop: () => void;
	switchShuffle: () => void;
	setPlayingState: (state: boolean) => void;
};

export const PlayerContext = createContext({} as PlayerContextProps);

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
	const [episodeList, setEpisodeList] = useState([]);
	const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLooping, setIsLooping] = useState(false);
	const [isShuffling, setIsShuffling] = useState(false);

	function play(episode: Episode) {
		setEpisodeList([episode]);
		setCurrentEpisodeIndex(0);
		setIsPlaying(true);
	}

	function playList(list: Episode[], index: number) {
		setEpisodeList(list);
		setCurrentEpisodeIndex(index);
		setIsPlaying(true);
	}

	const hasPrev = currentEpisodeIndex > 0;
	const hasNext = currentEpisodeIndex + 1 < episodeList.length || isShuffling;

	function playNext() {
		if (isShuffling) {
			const nextRandomEpIndex = Math.floor(Math.random() * episodeList.length);
			setCurrentEpisodeIndex(nextRandomEpIndex);
		} else if (hasNext) {
			setCurrentEpisodeIndex(currentEpisodeIndex + 1);
		}
	}
	function playPrevious() {
		if (hasPrev) {
			setCurrentEpisodeIndex(currentEpisodeIndex - 1);
		}
	}

	function switchPlay() {
		setIsPlaying(!isPlaying);
	}

	function switchLoop() {
		setIsLooping(!isLooping);
	}

	function switchShuffle() {
		setIsShuffling(!isShuffling);
	}

	function setPlayingState(state: boolean) {
		setIsPlaying(state);
	}

	return (
		<PlayerContext.Provider
			value={{
				episodeList,
				currentEpisodeIndex,
				hasNext,
				hasPrev,
				isPlaying,
				isShuffling,
				isLooping,
				switchLoop,
				switchPlay,
				switchShuffle,
				playList,
				play,
				playNext,
				playPrevious,
				setPlayingState,
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
}

export const usePlayer = () => {
	return useContext(PlayerContext);
};
