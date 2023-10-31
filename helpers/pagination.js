const test = () => {
    return 'hello'
}

const setPageParam = (req, ROWS_PER_PAGE) => {
    return req.query.page && !isNaN(req.query.page)
                ? parseInt((req.query.page - 1) * ROWS_PER_PAGE)
                : 0
}

const setPagination = (rowsPerPage, total, pageParam) => {
    lastPage = Math.ceil(total / rowsPerPage)

    currPage = parseInt(pageParam) && !isNaN(pageParam)
        ? (parseInt(pageParam) > lastPage ? lastPage : parseInt(pageParam))
        : 1

    nextPage = currPage == lastPage ? currPage : currPage + 1
    prevPage = currPage == 1 ? currPage : currPage - 1

    return {
        lastPage,
        currPage,
        nextPage,
        prevPage
    }
}

const setLimitQuery = (limit, offset) => {
    return `LIMIT ${limit} OFFSET ${offset}`
}

module.exports = {
    test,
    setPageParam,
    setPagination,
    setLimitQuery
}