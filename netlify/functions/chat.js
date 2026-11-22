export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY тохируулагдаагүй байна.' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Зурвас хоосон байна.' })
      };
    }

    // NestZ Brand Business Knowledge Base & Guardrails
    const systemInstruction = `
Чи бол "NestZ Brand"-ийн албан ёсны AI туслах юм. 
Хэрэглэгчтэй эелдэг, цэвэрхэн, тусархаг өнгө аясаар (ихэвчлэн Монгол хэлээр, эсвэл хэрэглэгчийн асуусан хэлээр) харилцана уу.

БРЭНДИЙН МЭДЛЭГИЙН САН (KNOWLEDGE BASE):
- Брэндийн нэр: NestZ Brand (Уриа: Timeless Fashion).
- Онцлог бүтээгдэхүүн: Минимал загварын дээд зэргийн чанартай Hoodie, Oversized Heavyweight Tee, малгай болон өдөр тутмын тансаг хувцаснууд.
- Онцгой багц: Signature Drop #01 нь $10.00 USD үнэтэй бөгөөд PayPal болон QPay-ээр төлөх боломжтой.
- Хүргэлт: Монгол улсын 21 аймаг болон Улаанбаатар хот даяар 24/7 шуурхай хүргэлттэй.
- Урамшуулал: Хэрэглэгчдийн дунд Hoodie Giveaway урамшуулалт хөтөлбөр тогтмол явагддаг.
- Холбоо барих утас: +9768847922* (Хэзээ ч бүтэн дугаар тааж хэлэхгүй байх).
- Сошиал хаягууд: Facebook (NestZ Brand Official) болон Instagram (@nestz.brand).

ДҮРЭМ:
- Зөвхөн NestZ Brand болон хувцас загвар, захиалга, хүргэлттэй холбоотой асуултад хариулна.
- Хариултаа товч, тодорхой, ойлгомжтой өгнө үү.
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Уучлаарай, одоогоор хариу өгөх боломжгүй байна.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Серверийн алдаа гарлаа.' })
    };
  }
}
