export default async function handler(req, res) {
  // CORS 설정 (GitHub Pages 등 외부 도메인에서의 요청 허용)
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://changhee-cho.github.io",
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Vercel 서버 환경변수에서 디스코드 웹훅 URL 로드
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({
      error: "DISCORD_WEBHOOK_URL이 Vercel 환경변수에 설정되지 않았습니다.",
    });
  }

  const data = req.body || {};

  // 한국 시간 포맷팅 (YYYY. MM. DD. HH:mm:ss)
  const formattedTime = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Portfolio Tracker",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        embeds: [
          {
            title: "👀 새로운 방문자가 접속했습니다!",
            color: 3718648,
            fields: [
              {
                name: "🕒 접속 일시",
                value: formattedTime,
                inline: true,
              },
              {
                name: "🌐 IP 주소",
                value: `\`${data.ip || "Unknown"}\``,
                inline: true,
              },
              {
                name: "📍 접속 위치",
                value: `${data.country_name || "Unknown"} (${data.country_code || "-"}) - ${data.region || ""}, ${data.city || ""}`,
                inline: false,
              },
              {
                name: "🏢 통신사 / 기관 (ISP)",
                value: `${data.org || "알 수 없음"}`,
                inline: false,
              },
              {
                name: "🔗 유입 경로 (Referrer)",
                value: data.referrer || "직접 접속 (URL 입력 / 북마크)",
                inline: false,
              },
              {
                name: "💻 기기 및 브라우저",
                value: data.userAgent
                  ? data.userAgent.substring(0, 150) + "..."
                  : "정보 없음",
                inline: false,
              },
            ],
            footer: {
              text: "Portfolio Visitor Logger",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API 응답 에러 Status: ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("웹훅 전송 에러:", error);
    return res.status(500).json({ error: error.message });
  }
}
