# Obsidian Store

이 저장소는 Obsidian 노트를 공개하는 GitHub 저장소입니다.

## [🌐 000 MKH Home](obsidian_store/🌐%20000%20MKH%20Home.md)

- ## 1st to 5th Level MOC
	- [📖 010 Themes](obsidian_store/📂%201st%20Level%20MOC/📖%20010%20Themes.md)
		- [📚 011 Interests](obsidian_store/📂%202nd%20Level%20MOC/📂%20010%20Themes/📚%20011%20Interests.md)
		- [📚 012 Topics](obsidian_store/📂%202nd%20Level%20MOC/📂%20010%20Themes/📚%20012%20Topics.md)
			- [📗 012.01 MCP](obsidian_store/📂%203rd%20Level%20MOC/012.01%20MCP/📗%20012.01%20MCP.md)
				- [📑 012.01.A MCP Theory](obsidian_store/📂%203rd%20Level%20MOC/012.01%20MCP/012.01.A%20MCP%20Theory/📑%20012.01.A%20MCP%20Theory.md)
				- [📑 012.01.B MCP Hands-On](obsidian_store/📂%203rd%20Level%20MOC/012.01%20MCP/012.01.B%20MCP%20Hands-On/📑%20012.01.B%20MCP%Hands-On.md)
			- [📗 012.02 A2A](obsidian_store/📂%203rd%20Level%20MOC/012.02%20A2A/📗%20012.02%20%20A2A.md)
		- [📚 013 Concepts](obsidian_store/📂%202nd%20Level%20MOC/📂%20010%20Themes/📚%20013%20Concepts.md)
		- [📚 014 Trends](obsidian_store/📂%202nd%20Level%20MOC/📂%20010%20Themes/📚%20014%20Trends.md)
	- [📖 020 Literature](obsidian_store/📂%201st%20Level%20MOC/📖%20020%20Literature.md)
	- [📖 030 Methodologies](obsidian_store/📂%201st%20Level%20MOC/📖%20030%20Methodologies.md)
	- [📖 040 Outputs](obsidian_store/📂%201st%20Level%20MOC/📖%20040%20Outputs.md)

## MCP Hands-On Guide

MCP 통신 방식에 따른 MCP server/client 구성에 대한 핸즈온 가이드입니다.

### MCP 관련 링크

- [Teddy Note Notion - MCP](https://teddylee777.notion.site/MCP-1c424f35d129802e998de5301edf1069)
- [Langchain MCP Adapters](https://github.com/langchain-ai/langchain-mcp-adapters)
- [Langchain mcpdoc](https://github.com/langchain-ai/mcpdoc/tree/main)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [fastmcp](https://github.com/jlowin/fastmcp)

### SSE 방식의 MCP 구현

#### Server
```python
# mcp_server_sse.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
	# Name of the MCP server
	"Weather",
	# LLM instructions for using the tool
	instructions = "You are a weather assistant that can answer questions about the weather in a given location",
	# Host address (0.0.0.0 allows connections from all IPs)
	host="0.0.0.0",
	# Port Number for the server
	port=8005,
)

@mcp.tool()
async def get_weather(location: str) -> str:
	"""
	Get current weather information for the specified location.

	Args:
		location (str): The name of the location

	Returns:
		str: A string containing weather info.
	"""
	return f"It's always Sunny in {location}"

if __name__ == "__main__":
	mcp.run(transport="sse")
```

#### Client
```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

async with MultiServerMCPClient(
	{
		"docs": {
			"url": "http://localhost:8005/sse",
			"transport": "sse"
		}
	}
) as client:
	agent = create_react_agent(model, client.get_tools())
	answer = await astream_graph_custom(agent, {"messages": "서울의 날씨는 어떠니?"})
```

### Stdio(Local) 방식의 MCP 구현

#### Server
```python
# mcp_server_stdio.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(...)

@mcp.tool()
async def get_weather(location: str) -> str:
	...

if __name__ == "__main__":
	mcp.run(transport="stdio")
```

#### Client
```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.tools import load_mcp_tools

server_params = StdioServerParameters(
	command="./.venv/bin/python",
	args=["mcp_server_stdio.py"],
)

async with stdio_client(server_params) as (read,write):
	# 클라이언트 세션 생성
	async with ClientSession(read, write) as session:
		# 연결 초기화
		await session.initialize()
		# MCP 도구 로드
		tools = await load_mcp_tools(session)
		# 에이전트 생성
		agent = create_react_agent(model, tools)
		# 에이전트 응답 스트리밍
		await astream_graph_custom(
			agent,
			{"messages": "서울의 날씨는 어떠니?"},
			stream_mode="updates" # REACT 에이전트는 updates 모드가 적합
		)
```

#### 실행 결과
```
[StructuredTool(name='get_weather', description='\n    Get current weather information for the specified location.\n\n    Args:\n        location (str): The name of the location (city, region, etc.) to get weather for\n\n    Returns:\n        str: A string containing weather information for the specified location\n    ', args_schema={'properties': {'location': {'title': 'Location', 'type': 'string'}}, 'required': ['location'], 'title': 'get_weatherArguments', 'type': 'object'}, response_format='content_and_artifact']

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 노드: agent
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
도구 호출: [{'name': 'get_weather', 'args': {'location': '서울'}, 'id': 'call_6LvpzhhIYPClBwkQvK8w7NtW', 'type': 'tool_call'}]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 노드: tools
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
도구 결과: It's always Sunny in 서울

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 노드: agent
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
응답: 서울은 항상 맑은 날씨라고 하네요! 다른 궁금한 점이 있으신가요?
```
