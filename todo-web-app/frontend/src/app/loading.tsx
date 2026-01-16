import { MdEmojiEmotions } from "react-icons/md";
import RippleLoader from "@/components/lightswind/ripple-loader";

export default function Loading() {
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
			<RippleLoader
				icon={<MdEmojiEmotions />}
				size={400}
				duration={3}
				logoColor={{ light: "#664b31", dark: "#f2d5b8" }}
				rippleColor={{ light: "#946e4a", dark: "#c7a990" }}
			/>
		</div>
	);
}
