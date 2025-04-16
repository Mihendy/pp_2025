# manager = WSConnectionManager()
#
#
# @app.get("/")
# async def get():
#     return
#
#
# @app.websocket("/ws/chat")
# async def chat_ws(websocket: WebSocket):
#     await websocket.accept()
#     data = await websocket.receive_json()
#     token = data.get("token")
#     chat_id = data.get("chat_id")
#     user = await get_current_user(token)
#
#     if not user:
#         await websocket.close(code=4000)
#         return
#
#     user_id = user["id"]
#
#     await manager.connect(websocket, user_id, chat_id)
#
#     rows = await database.fetch_all(Message.select().order_by(Message.c.timestamp.desc()).limit(20))
#     for row in reversed(rows):
#         await websocket.send_text(
#             json.dumps({"username": row["username"], "text": row["text"], "timestamp": str(row["timestamp"])}))
#
#     try:
#         while True:
#             data = await websocket.receive_text()
#             data_dict = json.loads(data)
#             username = data_dict["username"]
#             text = data_dict["text"]
#
#             await database.execute(messages.insert().values(username=username, text=text))
#
#             await manager.broadcast({
#                 "username": username,
#                 "text": text
#             }, chat_id)
#     except WebSocketDisconnect:
#         manager.disconnect(user_id, chat_id)
