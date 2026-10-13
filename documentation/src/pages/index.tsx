import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): ReactNode {
  return (
    <Layout title="Документация" description="Проектная документация TeamDocs">
      <main className="container margin-vert--xl">
        <h1>TeamDocs</h1>
        <p>Единая документация архитектуры, решений, учебного пути и личных инженерных заметок.</p>
        <p>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Открыть документацию
          </Link>
        </p>
      </main>
    </Layout>
  );
}
