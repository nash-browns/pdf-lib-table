import { calcColumnHeaderWidths } from "./headerDimensions";
import { calcColumnWidths } from "./columns";

export function processData(data, columns, maxTableHeight, options, forceFirstRow) {
    const columnHeaderWidths = calcColumnHeaderWidths(columns, options);
    const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = calcColumnWidths(data, columns, columnHeaderWidths, maxTableHeight, options, forceFirstRow);

    return [finalColumnDimensions, tableHeight, wrappedTableData, remainingData];
}
