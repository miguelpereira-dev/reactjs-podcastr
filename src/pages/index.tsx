import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { api } from '../service/api';
import { parseISO, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { toFormattedTimeString } from '../utils/toFormattedTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import Head from 'next/head';

type UnformattedEpisode = {
	id: string;
	title: string;
	members: string;
	published_at: string;
	thumbnail: string;
	file: {
		url: string;
		duration: string;
	};
};

type Episode = {
	id: string;
	title: string;
	members: string;
	publishedAt: string;
	thumbnail: string;
	duration: number;
	formattedDuration: string;
	url: string;
};

type HomeProps = {
	latestEpisodes: Episode[];
	allEpisodes: Episode[];
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
	const { playList } = usePlayer();

	const episodeList = [...latestEpisodes, ...allEpisodes];

	return (
		<div className={styles.homePage}>
			<Head>
				<title>Home | Podcastr</title>
			</Head>

			<section className={styles.latest}>
				<h1>Últimos lançamentos</h1>

				<ul>
					{latestEpisodes.map((episode, index) => {
						return (
							<li key={episode.id}>
								<Image
									width={192}
									height={192}
									objectFit="cover"
									src={episode.thumbnail}
									alt={episode.title}
								/>
								<div className={styles.episodeBody}>
									<Link href={`/episodes/${episode.id}`}>
										<a>{episode.title}</a>
									</Link>
									<p>{episode.members}</p>
									<span>{episode.publishedAt}</span>
									<span>{episode.formattedDuration}</span>
								</div>
								<button type="button" onClick={() => playList(episodeList, index)}>
									<img src="/play-green.svg" alt="Tocar episódio" />
								</button>
							</li>
						);
					})}
				</ul>
			</section>
			<section className={styles.allEpisodes}>
				<h2>Todos os episódios</h2>

				<table cellSpacing={0}>
					<thead>
						<tr>
							<th></th>
							<th>Podcast</th>
							<th>Integrantes</th>
							<th>Data</th>
							<th>Duração</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{allEpisodes.map((episode, index) => {
							return (
								<tr key={episode.id}>
									<td style={{ width: 80 }}>
										<Image
											width={120}
											height={120}
											src={episode.thumbnail}
											alt={episode.title}
											objectFit="cover"
										/>
									</td>
									<td>
										<Link href={`/episodes/${episode.id}`}>
											<a>{episode.title}</a>
										</Link>
									</td>
									<td>{episode.members}</td>
									<td style={{ width: 110 }}>{episode.publishedAt}</td>
									<td>{episode.formattedDuration}</td>
									<td>
										<button
											type="button"
											onClick={() => {
												playList(
													episodeList,
													index + latestEpisodes.length
												);
											}}
										>
											<img src="./play-green.svg" alt="Tocar episódio" />
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</section>
		</div>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at',
			_order: 'desc',
		},
	});

	const episodes: Episode[] = data.map((episode: UnformattedEpisode) => {
		return {
			id: episode.id,
			title: episode.title,
			members: episode.members,
			thumbnail: episode.thumbnail,
			publishedAt: format(parseISO(episode.published_at), 'd MMM y', {
				locale: ptBR,
			}),
			duration: Number(episode.file.duration),
			formattedDuration: toFormattedTimeString(Number(episode.file.duration)),
			url: episode.file.url,
		};
	});

	const latestEpisodes = episodes.slice(0, 2);

	const allEpisodes = episodes.slice(2, episodes.length);

	return {
		props: {
			latestEpisodes: latestEpisodes,
			allEpisodes: allEpisodes,
		},
		revalidate: 60 * 60 * 8,
	};
};
