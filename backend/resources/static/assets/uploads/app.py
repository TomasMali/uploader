from flask import Flask, request, jsonify
import os
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain import OpenAI,VectorDBQA
from langchain.document_loaders import UnstructuredFileLoader
from langchain.text_splitter import CharacterTextSplitter
import nltk
from flask_cors import CORS

app = Flask(__name__)
CORS(app)



api_key = os.environ.get('OPENAI_API_KEY')

nltk.download('punkt')


loader = UnstructuredFileLoader('jexp_registri_removed.pdf')
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=2619, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings(openai_api_key=api_key)

doc_search = Chroma.from_documents(texts,embeddings)

chain = VectorDBQA.from_chain_type(llm=OpenAI(), chain_type="stuff", vectorstore=doc_search)

@app.route('/', methods=['GET'])
def index():
    query = request.args.get('query')

    response_gpt = chain.run(query=query, max_tokens=4000)
    return jsonify(response_gpt)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8060)