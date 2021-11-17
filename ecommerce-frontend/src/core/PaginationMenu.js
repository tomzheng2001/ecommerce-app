import React from "react";

const PaginationMenu = ({ numPages }) => {
    var buttons = [];
    for (let i = 0; i < numPages; i++) {
        buttons.push(
            <li class="page-item">
                <a class="page-link" href="#">
                    {i + 1}
                </a>
            </li>
        );
    }

    return (
        <nav aria-label="Page navigation example">
            <ul class="pagination">{buttons}</ul>
        </nav>
    );
};

export default PaginationMenu;
