import apiService from "@/api/apiService";
import MainCard from "@/components/MainCard";
import ScrollX from "@/components/ScrollX";
import GencoTable from "@/components/Table";
import { KIOSK } from "@/types/kiosk";
import { IResult } from "@/types/result";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { columns } from "./dto/data";
import { useLocation } from "react-router-dom";
import { Ifilter } from "@/types/IFilter";

const Kiosks = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryObject = Object.fromEntries(queryParams.entries());
  const [filter, setFilter] = useState<Ifilter>({
    pageIndex: 0,
    pageSize: 10,
    ...queryObject,
  });
  const [data, setData] = useState<{ total: number; list: KIOSK[] }>({
    total: 0,
    list: [],
  });
  const { loading, runAsync } = useRequest(
    (query) => apiService.kisok.getKiosks(query),
    { manual: true }
  );

  const fetchKiosks = async ({
    pageIndex,
    pageSize,
    ...rest
  }: Ifilter): Promise<IResult<KIOSK>> => {
    let query = { skip: pageIndex * pageSize, take: pageSize, ...rest };
    const { data } = await runAsync(query);
    return {
      total: data.count,
      list: data.data,
    };
  };

  useEffect(() => {
    setFilter((prevFilter) => ({
      pageIndex: prevFilter.pageIndex,
      pageSize: prevFilter.pageSize,
      ...queryObject,
    }));
  }, [location.search]);

  // only used to refresh kiosks list
  useEffect(() => {
    (async () => {
      let data = await fetchKiosks(filter);
      setData(data);
    })();
  }, [filter]);

  return (
    <MainCard key={1} content={false}>
      <ScrollX>
        <GencoTable
          tableTitle="Kiosks"
          columns={columns}
          pagination={{
            pageSize: filter.pageSize,
            pageIndex: filter.pageIndex,
          }}
          onPageChange={async (e: any) => setFilter({ ...e, name: null })}
          count={data.total}
          isLoading={loading}
          data={data.list}
        />
      </ScrollX>
    </MainCard>
  );
};

export default Kiosks;
