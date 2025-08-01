import pandas as pd
import requests
import time
from datetime import datetime

df_main_cost = pd.DataFrame()
df_main_usage = pd.DataFrame()


## ADmin key from https://platform.openai.com/settings/organization/admin-keys
## differenct than user api key which is for chat requests
ADMIN_KEY = ""  # from your org’s admin settings
headers = {
    "Authorization": f"Bearer {ADMIN_KEY}",
    "Content-Type": "application/json",
}

def fetch_usage(days=7):
    params = {
        "start_time": int(datetime.now().timestamp()) - days - 86400,
        "bucket_width": "1d",
        "group_by": ["model"],
        "limit": days
    }
    resp = requests.get(
        "https://api.openai.com/v1/organization/usage/completions",
        headers=headers, params=params
    )
    resp.raise_for_status()
    return resp.json()["data"]  # list of usage buckets

def fetch_costs(days=7):
    params = {
        "start_time": int(datetime.now().timestamp()) - days - 86400,
        "bucket_width": "1d",
        "limit": days
    }
    resp = requests.get(
        "https://api.openai.com/v1/organization/costs",
        headers=headers, params=params
    )
    resp.raise_for_status()
    return resp.json()["data"]


def parse_request_data(df):

    df = df.explode("results")
    join_back = pd.json_normalize(df["results"])
    df = join_back.merge(df,left_index=True,right_index=True,how="left",suffixes=("_request","_json"))

    return df

def prep_data(df):

    local_dt = pd.Timestamp.now(tz="America/New_York")


    create_cols = {"start_time":pd.to_datetime(df["start_time"], unit='s'),
                   "end_time":pd.to_datetime(df["end_time"],unit='s'),
                   "fetch_time":local_dt.tz_convert("UTC")
    }

    return df.assign(**create_cols)


def request_new_data():

    costs = fetch_costs()
    usage = fetch_usage()

    df_cost = pd.DataFrame(costs).pipe(parse_request_data).pipe(prep_data)
    df_usage = pd.DataFrame(usage).pipe(parse_request_data).pipe(prep_data)

    return {"cost":df_cost,
           "usage":df_usage}


response = request_new_data()

df_main_cost = pd.concat([df_main_cost,response["cost"]],ignore_index=True)
df_main_usage = pd.concat([df_main_usage,response["usage"]],ignore_index=True)

df_main_cost
