import { CustomerProtected } from '../../../components/customer-protected';
import { DownloadCard } from '../../../components/download-card';
import { SiteHeader } from '../../../components/site-header';
const downloads = [['Play Store', 'Versão oficial Android', 'https://play.google.com/'], ['Roku TV', 'Versão Roku', '#roku'], ['Samsung', 'Versão Samsung', '#samsung'], ['LG', 'Versão LG', '#lg'], ['Android', 'APK oficial', '#android'], ['Android TV', 'Versão TV', '#android-tv']];
export default function CustomerDownloadsPage() { return <CustomerProtected><main className="page-bg"><SiteHeader /><section className="container" style={{ paddingTop: 50, paddingBottom: 50 }}><h1>Downloads da sua conta</h1><div className="grid-3" style={{ marginTop: 24 }}>{downloads.map(([title, description, href]) => <DownloadCard key={title} title={title} description={description} href={href} />)}</div></section></main></CustomerProtected>; }
