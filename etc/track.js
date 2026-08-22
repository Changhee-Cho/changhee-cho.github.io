(async function logToDiscord() {
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:"
  ) {
    return;
  }

  if (sessionStorage.getItem("discord_logged")) {
    return;
  }

  // 날짜/시간 정밀 포맷 함수 (YYYY. MM. DD. HH:mm:ss)
  function getKoreanFormattedTime() {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const DISCORD_WEBHOOK_URL =
      "https://discordapp.com/api/webhooks/1540716743234822165/RAmyZwShfQ8aXmZNaAOEIESdZZ_EtfBjSpWF5xO4WSY3G5q73W4YnmipynCMSOr7kIA4";

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
            title: "👀 새로운 방문자가 접속했습니다!",
            color: 3718648,
            fields: [
              {
                name: "🕒 접속 일시",
                value: getKoreanFormattedTime(), // 수정된 함수 사용
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
    // 접속 1회 이후로는 알림을 받기 싫으면 추후 이 주석 해제
    // sessionStorage.setItem("discord_logged", "true");
  } catch (error) {
    console.error("Discord 알림 전송 실패:", error);
  }
})();
