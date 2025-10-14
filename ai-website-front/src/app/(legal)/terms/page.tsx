import { Metadata } from "next";

export const metadata: Metadata = {
    title: "이용약관",
    description: "서비스 이용약관",
};

export default function TermsPage() {
    return (
        <article className="space-y-6">
            <h1>이용약관</h1>

            <section>
                <h2>제 1 조 (목적)</h2>
                <p>
                    본 약관은 Trynic (이하 &quot;회사&quot;라 함)이 제공하는 서비스의 이용조건 및 절차,
                    회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                </p>
            </section>

            <section>
                <h2>제 2 조 (용어의 정의)</h2>
                <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ul>
                    <li>&quot;서비스&quot;란 회사가 제공하는 모든 서비스를 의미합니다.</li>
                    <li>&quot;회원&quot;이란 회사와 서비스 이용계약을 체결한 자를 의미합니다.</li>
                    <li>&quot;콘텐츠&quot;란 회사가 제공하는 모든 형태의 정보나 자료를 의미합니다.</li>
                </ul>
            </section>

            <section>
                <h2>제 3 조 (약관의 효력 및 변경)</h2>
                <p>
                    본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.
                    회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 회사가 제공하는 웹사이트에
                    공지함으로써 효력이 발생합니다.
                </p>
            </section>
        </article>
    );
} 