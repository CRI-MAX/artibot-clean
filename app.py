from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Imposta la chiave API da variabile d'ambiente
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').strip() if data else ''

    if not message:
        return jsonify({"reply": "Non ho ricevuto nulla. Vuoi riprovare?"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            temperature=0.8,
            max_tokens=300,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Sei Artibot, un assistente creativo, ironico e ispirante. "
                        "Dai consigli artistici, suggerimenti manuali e incoraggiamenti "
                        "con un tono amichevole e brillante."
                    )
                },
                {"role": "user", "content": message}
            ]
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        print("Errore:", e)
        return jsonify({"reply": "Ops! Qualcosa è andato storto. Riprova tra poco."}), 500

# ⚠️ Solo per test locali. Render usa Gunicorn.
if __name__ == '__main__':
    app.run(debug=True)