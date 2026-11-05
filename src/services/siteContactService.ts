import { api } from "./apiService";

export interface PublicSiteContact {
	email: string;
	whatsapp: string;
	whatsappPic: string;
	instagram: string;
	tiktok: string;
	address: string;
	maps: string;
}

interface ApiSuccess<T> {
	data: T;
}

interface PublicHomeContent {
	page?: {
		sections?: { sectionKey: string; content?: Record<string, unknown> }[];
	};
}

export const emptyPublicSiteContact: PublicSiteContact = { email: "", whatsapp: "", whatsappPic: "", instagram: "", tiktok: "", address: "", maps: "" };
let cachedContact: PublicSiteContact | null = null;
let cachedAt = 0;
let request: Promise<PublicSiteContact> | null = null;

export function getPublicSiteContact(): Promise<PublicSiteContact> {
	if (cachedContact && Date.now() - cachedAt < 60_000) return Promise.resolve(cachedContact);
	if (!request) {
		request = api.get<ApiSuccess<PublicHomeContent>>("/public/tenants/obc-barber/content", {
			params: { page: "home", lang: "id" },
		}).then(({ data }) => {
			const content = data.data.page?.sections?.find((section) => section.sectionKey === "site-contact")?.content;
			const readString = (key: keyof PublicSiteContact) => typeof content?.[key] === "string" ? (content[key] as string).trim() : "";
			return {
				email: readString("email"),
				whatsapp: readString("whatsapp"),
				whatsappPic: readString("whatsappPic"),
				instagram: readString("instagram"),
				tiktok: readString("tiktok"),
				address: readString("address"),
				maps: readString("maps"),
			};
		}).catch(() => emptyPublicSiteContact).then((contact) => {
			cachedContact = contact;
			cachedAt = Date.now();
			return contact;
		}).finally(() => { request = null; });
	}
	return request;
}

export function getWhatsAppHref(value: string | null | undefined): string {
	const contact = value?.trim() ?? "";
	if (!contact) return "";
	if (/^https?:\/\//i.test(contact)) return contact;
	let digits = contact.replace(/\D/g, "");
	if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
	else if (!digits.startsWith("62")) digits = `62${digits}`;
	return digits.length > 2 ? `https://wa.me/${digits}` : "";
}