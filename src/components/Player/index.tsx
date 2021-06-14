import Image from 'next/image';
import {  useEffect, useRef, useState } from 'react';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './styles.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';
import { toFormattedTimeString } from '../../utils/toFormattedTimeString';

export function Player() {
	const [progress, setProgress] = useState(0);



	function setupProgressListener(){
		audioRef.current.currentTime = 0

		audioRef.current.addEventListener('timeupdate', () => {
			setProgress(Math.floor(audioRef.current.currentTime))
		})
	}

	function handleSeek(amount: number) {
		audioRef.current.currentTime = amount
		setProgress(amount)
	}

	function handleEndEp() {
		if (hasNext){

		}
	}

	const {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		isLooping,
		isShuffling,
		hasPrev,
		hasNext,
		switchLoop,
		switchPlay,
		switchShuffle,
		playNext,
		playPrevious,
		setPlayingState,
	} = usePlayer();

	const episode = episodeList[currentEpisodeIndex];
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}

		if (isPlaying) {
			audioRef.current.play();
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying]);

	return (
		<div className={styles.playerContainer}>
			<header>
				<img src="/playing.svg" alt="Tocando agora" />
				<strong>Tocando agora</strong>
			</header>

			{episode ? (
				<div className={styles.currentEpisode}>
					<Image width={592} height={592} objectFit="cover" src={episode.thumbnail} />
					<strong>{episode.title}</strong>
					<span>{episode.members}</span>
				</div>
			) : (
				<div className={styles.emptyPlayer}>
					<strong>Selecione um podcast para ouvir</strong>
				</div>
			)}

			<footer className={!episode ? styles.empty : ''}>
				<div className={styles.progress}>
					<span>{toFormattedTimeString(progress)}</span>
					<div className={styles.slider}>
						{episode ? (
							<Slider
								max={episode.duration}
								value={progress}
								onChange={handleSeek}
								trackStyle={{ backgroundColor: '#04D361' }}
								railStyle={{ backgroundColor: '9f75ff' }}
								handleStyle={{
									borderColor: '#04D361',
									borderWidth: 4,
								}}
							/>
						) : (
							<div className={styles.emptySlider} />
						)}
					</div>
					<span>{toFormattedTimeString(episode?.duration ?? 0)}</span>
				</div>

				{episode && (
					<audio
						src={episode.url}
						ref={audioRef}
						loop={isLooping}
						onEnded={handleEndEp}
						onPlay={() => setPlayingState(true)}
						onPause={() => setPlayingState(false)}
						onLoadedMetadata={setupProgressListener}
						autoPlay
					/>
				)}

				<div className={styles.buttons}>
					<button
						type="button"
						disabled={!episode || episodeList.length == 1}
						onClick={switchShuffle}
						className={isShuffling ? styles.isActive : ''}
					>
						<img src="/shuffle.svg" alt="Embaralhar" />
					</button>

					<button type="button" disabled={!episode || !hasPrev} onClick={playPrevious}>
						<img src="/play-previous.svg" alt="Tocar anterior" />
					</button>

					<button
						type="button"
						className={styles.playButton}
						disabled={!episode}
						onClick={switchPlay}
					>
						{isPlaying ? (
							<img src="/pause.svg" alt="Pausar" />
						) : (
							<img src="/play.svg" alt="Tocar" />
						)}
					</button>

					<button type="button" disabled={!episode || !hasNext} onClick={playNext}>
						<img src="/play-next.svg" alt="Tocar próximo" />
					</button>

					<button
						type="button"
						disabled={!episode}
						onClick={switchLoop}
						className={isLooping ? styles.isActive : ''}
					>
						<img src="/repeat.svg" alt="Repetir" />
					</button>
				</div>
			</footer>
		</div>
	);
}
