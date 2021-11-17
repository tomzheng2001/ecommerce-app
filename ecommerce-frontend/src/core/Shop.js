import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Card from "./Card";
import Checkbox from "./Checkbox";
import RadioBox from "./Radiobox";
import { getCategories, getFilteredProducts } from "./apiCore";
import { prices } from "./fixedPrices";
// import PaginationMenu from "./PaginationMenu";

const Shop = () => {
    const [myFilters, setMyFilters] = useState({
        filters: {
            category: [],
            price: [],
        },
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(false);
    const [limit, setLimit] = useState(6);
    const [skip, setSkip] = useState(0);
    const [size, setSize] = useState(0);
    const [filteredResults, setFilteredResults] = useState([]);

    const init = () => {
        getCategories().then((data) => {
            if (data.error) {
                setError(data.error);
            } else {
                setCategories(data);
            }
        });
    };

    const loadFilteredResults = (newFilters) => {
        // console.log(newFilters);
        getFilteredProducts(skip, limit, newFilters).then((data) => {
            if (data.error) {
                setError(data.error);
            } else {
                setFilteredResults(data.data);
                setSize(data.size);
                setSkip(0);
            }
        });
    };

    const loadMore = () => {
        let toSkip = skip + limit;
        getFilteredProducts(toSkip, limit, myFilters.filters).then((data) => {
            if (data.error) {
                setError(data.error);
            } else {
                setFilteredResults([...filteredResults, ...data.data]);
                setSize(data.size);
                setSkip(toSkip);
            }
        });
    };

    const loadMoreButton = () => {
        return (
            size > 0 &&
            size >= limit && (
                <button onClick={loadMore} className="btn btn-warning mb-5">
                    Load more
                </button>
            )
        );
    };

    useEffect(() => {
        init();
        loadFilteredResults(myFilters.filters);
    }, []);

    const handleFilters = (filters, filterBy) => {
        const newFilters = { ...myFilters };
        newFilters.filters[filterBy] = filters;
        if (filterBy === "price") {
            let priceValues = handlePrice(filters);
            newFilters.filters[filterBy] = priceValues;
        }
        loadFilteredResults(myFilters.filters);
        setMyFilters(newFilters);
    };

    const handlePrice = (value) => {
        const data = prices;
        let array = [];
        for (let key in data) {
            if (data[key]._id === parseInt(value)) {
                array = data[key].array;
            }
        }
        return array;
    };

    return (
        <Layout
            title="Shop Here"
            description="Find the perfect device for you!"
            className="container-fluid"
        >
            <div className="row">
                <div className="col-3 sidebar">
                    <h4>Filter by categories</h4>
                    <ul>
                        <Checkbox
                            categories={categories}
                            handleFilters={(filters) =>
                                handleFilters(filters, "category")
                            }
                        />
                    </ul>

                    <h4>Filter by price</h4>
                    <div>
                        <RadioBox
                            prices={prices}
                            handleFilters={(filters) =>
                                handleFilters(filters, "price")
                            }
                        />
                    </div>
                </div>

                <div className="col-9">
                    <h2 className="mb-4">Products</h2>
                    <div className="row">
                        {filteredResults.map((product, i) => (
                            <div key={i} className="col-4 mb-3">
                                <Card product={product} />
                            </div>
                        ))}
                    </div>
                    <hr />
                    {loadMoreButton()}
                    {/* <PaginationMenu numPages={size / limit + 1} /> */}
                </div>
            </div>
        </Layout>
    );
};

export default Shop;
