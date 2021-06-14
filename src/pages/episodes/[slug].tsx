import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head  from 'next/head';
import Image from 'next/image';

import Link from 'next/link';

import { useRouter } from 'next/router';
import { usePlayer } from '../../contexts/PlayerContext';
import { api } from '../../service/api';
import { toFormattedTimeString } from '../../utils/toFormattedTimeString';

import styles from './episode.module.scss';

type Episode = {
	id: string;
	title: string;
	members: string;
	publishedAt: string;
	thumbnail: string;
	duration: number;
	formattedDuration: string;
	url: string;
	description: string;
};

type EpisodeProps = {
	episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
	const router = useRouter();
	const { play } = usePlayer();

	return (
		<div className={styles.episode}>
			<Head>
				<title>{episode.title} | Podcastr</title>
			</Head>

			<div className={styles.thumbContainer}>
				<Link href="/">
					<button type="button">
						<img src="/arrow-left.svg" alt="Voltar" />
					</button>
				</Link>
				<Image src={episode.thumbnail} width={700} height={160} objectFit="cover" />
				<button type="button" onClick={() => play(episode)}>
					<img src="/play.svg" alt="Tocar" />
				</button>
			</div>

			<header>
				<h1>{episode.title}</h1>
				<span>{episode.members}</span>
				<span>{episode.publishedAt}</span>
				<span>{episode.formattedDuration}</span>
			</header>

			<div
				className={styles.description}
				dangerouslySetInnerHTML={{ __html: episode.description }}
			/>
		</div>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at',
			_order: 'desc',
		},
	});

	const paths = data.map((episode) => {
		return {
			params: {
				slug: episode.id,
			},
		};
	});

	return {
		paths,
		fallback: 'blocking',
	};
};

export const getStaticProps: GetStaticProps = async (context) => {
	const { slug } = context.params;

	const { data } = await api.get(`/episodes/${slug}`);

	const episode = {
		id: data.id,
		title: data.title,
		members: data.members,
		thumbnail: data.thumbnail,
		description: data.description,
		publishedAt: format(parseISO(data.published_at), 'd MMM y', {
			locale: ptBR,
		}),
		duration: Number(data.file.duration),
		formattedDuration: toFormattedTimeString(Number(data.file.duration)),
	};

	return {
		props: { episode: episode },
		revalidate: 60 * 60 * 36,
	};
};
