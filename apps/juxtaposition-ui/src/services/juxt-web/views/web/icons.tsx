/* eslint-disable no-restricted-imports -- raw import plugin does not support path aliases */
import { InlineStyle } from '@/services/juxt-web/views/common';
import heartIcon from './assets/heart_icon.svg?raw';
import replyIcon from './assets/reply_icon.svg?raw';
import menuIcon from './assets/menu_icon.svg?raw';
import flagIcon from './assets/flag_icon.svg?raw';
import binIcon from './assets/bin_icon.svg?raw';
import shareIcon from './assets/share_icon.svg?raw';
import type { ReactNode } from 'react';

const icons = {
	heart: heartIcon,
	reply: replyIcon,
	menu: menuIcon,
	flag: flagIcon,
	bin: binIcon,
	share: shareIcon
} as const;

type WebIcon = keyof typeof icons;

export type WebIconProps = {
	name: WebIcon;
};

export function WebIcon(props: WebIconProps): ReactNode {
	const iconHtml = icons[props.name];
	return <span style={{ lineHeight: '0.7' }} dangerouslySetInnerHTML={{ __html: iconHtml }} />;
}

export function PretendoLogo(): ReactNode {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="120" height="39.876">
			<g id="logo_type" data-name="logo type" transform="translate(-553 -467)">
				<g id="logo" transform="translate(553 467)">
					<rect id="XMLID_158_" width="39.876" height="39.876" fill="#9d6ff3" opacity="0"></rect>
					<g id="XMLID_6_" transform="translate(8.222 1.418)">
						<path id="XMLID_15_" d="M69.149,28.312c-1.051.553-.129,2.139.922,1.585a12.365,12.365,0,0,1,8.794-.571,10.829,10.829,0,0,1,6.342,4.166c.645,1,2.231.074,1.585-.922C83.308,27.169,74.7,25.436,69.149,28.312Z" transform="translate(-64.246 -23.389)" fill="#9d6ff3"></path>
						<path id="XMLID_14_" d="M82.64,14.608A15.565,15.565,0,0,0,73.5,8.45a17.535,17.535,0,0,0-12.647.9c-1.051.553-.129,2.139.922,1.585,3.411-1.788,7.6-1.714,11.209-.719,3.1.848,6.268,2.544,8.038,5.309C81.681,16.543,83.267,15.622,82.64,14.608Z" transform="translate(-57.476 -7.693)" fill="#9d6ff3"></path>
						<path id="XMLID_9_" d="M55.68,47.8a10.719,10.719,0,0,0-6.71,2.3H45.983A1.336,1.336,0,0,0,44.6,51.376V75.84a1.431,1.431,0,0,0,1.383,1.383h3.023a1.367,1.367,0,0,0,1.309-1.383V68.392A10.993,10.993,0,1,0,55.68,47.8Zm0,17.182a6.213,6.213,0,1,1,6.213-6.213A6.216,6.216,0,0,1,55.68,64.982Z" transform="translate(-44.6 -40.406)" fill="#9d6ff3"></path>
					</g>
				</g>
				<text id="Pretendo" transform="translate(593 492)" fill="#fff" fontSize="17" fontFamily="Poppins-Bold, Poppins" fontWeight="700">
					<tspan x="0" y="0">Pretendo</tspan>
				</text>
			</g>
		</svg>
	);
}

export function JuxtLogo(): ReactNode {
	return (
		<svg
			id="Layer_1"
			data-name="Layer 1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 232.63 100.33"
		>
			<defs>
				<InlineStyle
					src={`
				.cls-1{fill:#fff;}.cls-2{fill:#9d6ff3;}.cls-3{font-size:30.54px;fill:#59c9a5;font-family:Poppins-Bold, Poppins;font-weight:700;}
			  `}
				/>
			</defs>
			<path
				className="cls-1"
				d="M25.62,0H40V40.2c0,12.69-7.73,19.41-19.41,19.41C8.49,59.61,0,52.55,0,39.28H14.28c0,5,2.19,7.47,5.88,7.47,3.45,0,5.46-2.18,5.46-6.55Z"
			/>
			<path
				className="cls-1"
				d="M51.33,0H65.69V35.33c0,7,3.45,11,10.25,11s10.42-4,10.42-11V0h14.37v35.2c0,16.3-11.43,24.37-25,24.37S51.33,51.54,51.33,35.24Z"
			/>
			<path
				className="cls-1"
				d="M134.92,41,124.33,59H108l18.91-30L107.61,0h16.72l11.85,17.81L146.6,0h16.29L144.16,29.78,163.65,59H146.93Z"
			/>
			<path
				className="cls-2"
				d="M119.86,18.41,126.94,29,108,59h16.3L134.92,41l12,18.06h16.72L144.16,29.78,162.89,0H146.6L136.18,17.85l-7-10.54A70.15,70.15,0,0,0,119.86,18.41Z"
			/>
			<path
				className="cls-2"
				d="M167.68,0H213.3V11.51H197.67V59H183.31V11.51H167.68Z"
			/>
			<circle className="cls-2" cx="225.67" cy="52.02" r="6.96" />
			<text className="cls-3" transform="translate(77.71 100.33)">
				BETA
			</text>
		</svg>
	);
}
