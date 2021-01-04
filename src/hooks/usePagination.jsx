import { useState, useRef } from 'react';

const usePagination = (props, tableManager) => {
    const { mode, config: { isPaginated }, rowsApi: { rows, totalRows } } = tableManager;

    const paginationApi = useRef({}).current;
    const [page, setPage] = useState(props.page || 1);
    const [pageSize, setPageSize] = useState(props.pageSize || 20);

    paginationApi.page = props.page ?? page;
    paginationApi.pageSize = props.pageSize ?? pageSize;
    paginationApi.totalPages = Math.ceil(totalRows / paginationApi.pageSize);
    paginationApi.pageRows = rows;

    if (isPaginated) {
        paginationApi.pageRows = rows.slice((paginationApi.pageSize * paginationApi.page - paginationApi.pageSize), (paginationApi.pageSize * paginationApi.page));
        
        // fill missing page rows with nulls - makes sure we display PlaceHolderCells when moving to a new page (while not using virtual scroll)
        if ((mode !== 'sync') && (paginationApi.pageRows.length < paginationApi.pageSize)) {
            let totalMissingRows = paginationApi.pageSize - paginationApi.pageRows.length;
            if (paginationApi.page === Math.max(paginationApi.totalPages, 1)) totalMissingRows = totalRows % paginationApi.pageSize - paginationApi.pageRows.length;
            for (let i = 0; i < totalMissingRows; i++) {
                paginationApi.pageRows.push(null);
            }
        }
    }

    paginationApi.setPage = page => {
        page = ~~page;
        if ((page < 1) || (paginationApi.totalPages < page)) return;

        if (props.page === undefined || props.onPageChange === undefined) setPage(page);
        props.onPageChange?.(page, tableManager);

        setTimeout(() => tableManager.refs.tableRef.current.scrollTop = 0, 0);
    }

    paginationApi.setPageSize = pageSize => {
        pageSize = ~~pageSize;

        if (props.pageSize === undefined || props.onPageSizeChange === undefined) setPageSize(pageSize);
        props.onPageSizeChange?.(pageSize, tableManager);
    }

    return paginationApi;
}

export default usePagination;