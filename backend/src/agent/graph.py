from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, END,START ,MessagesState 
from langchain_core.messages import SystemMessage, HumanMessage,AIMessage,ToolMessage ,BaseMessage
from typing import TypedDict, List,Annotated ,Literal 
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.config import get_stream_writer
import time
from langchain.prompts import ChatPromptTemplate
from uuid import uuid4
from pydantic import BaseModel, Field 
from langchain_core.tools import tool

from langchain_core.tools import Tool
from langchain_experimental.utilities import PythonREPL
# from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from typing import TypedDict, List, Optional
from langchain_core.messages import BaseMessage





llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash',api_key="AIzaSyBABn5Xb0fbtwmagpA-9H0Z9M5h6yWvvGk")




max_iters=3


python_env = PythonREPL()
# result =python_repl.run("print(\"hello world\")")
# # print(result)


# # You can create the tool to pass to an agent
python_repl = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`.",
    func=python_env.run,
)


# print(python_repl.invoke("python print('hello world')"))
# print(python_repl.invoke('''python print(55)'''))



@tool
def pythone(code:str):
    """use this function to execute python code and get results
        Args:
    code:str = only python code 
        """
    try: 
        result = python_repl.invoke(code)
        # print(result)
    except BaseException as e:
        return f"failed to execution error:{e}"

    return f"result of code execution {result}"



tools = [pythone]
tools_by_name = {tool.name: tool for tool in tools}
# print(pythone.invoke("print(55)"))

llm_with_tools = llm.bind_tools(tools=[pythone],tool_choice=["pythone"])

# result = llm_with_tools.invoke('a python code for simple OOP class and object')
# exect = pythone.invoke(result.tool_calls[0]['args']['code'])
# print(exect)
# import pprint
# pprint.pprint(result.tool_calls[0]['args'])




class State(TypedDict, total=False):
    messages: List[BaseMessage]              # input
    user_input: Optional[str]
    new_input: Optional[str]
    iterations: Optional[int]
    code_output: Optional[str]
    final_response: Optional[List[str]]


def tool_node(state: State):
    """Performs the tool call"""
    # print("-----tool_node-----")
    result = []
    messages = state["messages"] or []
    
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": messages + result}





def should_continue(state:State) -> Literal["environment", END]:
    """
    Decide if we should continue execution or stop.
    """
    messages = state.get("messages",[])
    last_message = messages[-1] 
    iterations = state.get("iterations",0) or  0
    
    if iterations > max_iters:
        return END  # Stop execution if max iterations are reached
    if last_message.tool_calls:
        return "environment"  # Continue execution if the LLM made a tool call
    return END






def llm_call(state: State):
    """
    The LLM agent node. Generates code, calls tools, and analyzes results.
    """
    # # print("----- Calling LLM -----")

    # # user_input = state["user_input"] 
    # user_input = state["messages"]  or  []
    # iterations = state.get("iterations",0) or [] 
    # new_input = state["new_input"]  or "True"
    messages = state.get("messages", [])
    user_input = state.get("messages", [])
    iterations = state.get("iterations", 0)
    new_input = state.get("new_input", "True")

    # if len(messages) == 0:
    #     messages += [
    #         SystemMessage(content="""You are a Python coding assistant with expertise in exploratory data analysis.
    #         Use the python_repl tool to execute the code. If an error occurs, resolve it and retry up to 3 times.
    #         Once execution succeeds, analyze the result and provide insights.
    #         Structure responses with a prefix, code block, result, and analysis."""
    #         )
    #     ]
    
    if new_input == "True": 
        messages += [
            HumanMessage(content=f"write only python code {user_input} , format should be '''import dependencies \n\n code only''' with run function , not use: if __name__=='__main__'. necessary  making A Python REPL tool_calls ")
        ]
        new_input = "False"
                
    code_solution = llm_with_tools.invoke(messages)
    # print(code_solution)
    # print("code tool call :",code_solution.tool_calls)
    messages += [(code_solution)]
    
    iterations += 1
    return {"messages": messages ,"final_response":code_solution.tool_calls[-1]['args']['code'], "iterations": iterations, "new_input": new_input}




agent_builder = StateGraph(State)

# Add nodes
agent_builder.add_node("llm_call", llm_call)
agent_builder.add_node("environment", tool_node)

# Add edges
agent_builder.add_edge(START, "llm_call")
agent_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    {
        "environment": "environment",
        END: END
    }
)

agent_builder.add_edge("environment", "llm_call")
graph = agent_builder.compile()



# question = "function for two variable  a and b , return variable sum"
# question = "python function add two variable and run"

# solution = graph.invoke({"user_input": question, "messages":[], "iterations": 0, "new_input": "True"})
# print("\n\n")
# print(solution['final_response'])


