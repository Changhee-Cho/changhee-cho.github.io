(async function logVisitor() {
  //   로컬 개발 환경(localhost, 127.0.0.1) 접속 시 알림 발송 제외
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:"
  ) {
    console.log("로컬 개발 환경에서는 Discord 알림을 전송하지 않습니다.");
    return;
  }

  // 브라우저 세션 중복 로깅 방지 (한 방문자가 새로고침/탭 이동 시 알림 도배 방지)
  if (sessionStorage.getItem("visited_logged")) {
    return;
  }

  try {
    // 1. 방문자 IP 및 상세 Geolocation 정보 조회
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    // 2. 디스코드 웹훅 엔드포인트
    const DISCORD_WEBHOOK_URL =
      "https://discordapp.com/api/webhooks/1540716743234822165/RAmyZwShfQ8aXmZNaAOEIESdZZ_EtfBjSpWF5xO4WSY3G5q73W4YnmipynCMSOr7kIA4";

    // 3. Discord Embed 형태로 전송
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Portfolio Tracker",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        embeds: [
          {
            title: "👀 새로운 방문자가 포트폴리오에 접속했습니다!",
            color: 3718648, // 포인트 컬러 (#38bdf8)
            fields: [
              {
                name: "🕒 접속 일시",
                value: new Date().toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                }),
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
                value: document.referrer
                  ? document.referrer
                  : "직접 접속 (URL 입력 / 북마크)",
                inline: false,
              },
              {
                name: "💻 기기 및 브라우저",
                value: navigator.userAgent.substring(0, 150) + "...",
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

    // 세션 스토리지 플래그 설정
    /* 만약 새로고침 할 때는 알림을 안 받고 싶다면 이 부분 주석 해제 1줄 */
    // sessionStorage.setItem("visited_logged", "true");
  } catch (error) {
    console.error("방문자 트래킹 에러:", error);
  }
})();
