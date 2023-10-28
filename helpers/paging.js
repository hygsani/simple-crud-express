const test = () => {
    return 'hello'
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

module.exports = {
    test,
    setPagination
}