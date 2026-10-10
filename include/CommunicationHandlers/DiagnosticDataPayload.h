#pragma once

#include "Operations/AbstractOperation.h"

#include <algorithm>
#include <vector>

namespace EFIGenie
{
	inline bool IsLittleEndian()
	{
		const uint16_t value = 1;
		return *reinterpret_cast<const uint8_t *>(&value) == 1;
	}

	inline bool AppendOperationResult(OperationArchitecture::AbstractOperation *operation, std::vector<uint8_t> &response)
	{
		OperationArchitecture::Variable result;
		OperationArchitecture::Variable *variables[] = { &result };
		operation->AbstractExecute(variables);

		const size_t resultSize = result.Size();
		if(resultSize == 0 || result.Type == OperationArchitecture::POINTER)
			return false;

		const size_t offset = response.size();
		response.resize(offset + resultSize);
		const bool isScalar = result.Type >= OperationArchitecture::UINT8
			&& result.Type <= OperationArchitecture::DOUBLE;
		if(IsLittleEndian() && isScalar && resultSize > 1)
			std::reverse_copy(result.ValueArray, result.ValueArray + resultSize, response.begin() + offset);
		else
		{
			const uint8_t *resultData = result.Type == OperationArchitecture::BIGOTHER
				? static_cast<const uint8_t *>(result.POINTERValue)
				: result.ValueArray;
			std::copy(resultData, resultData + resultSize, response.begin() + offset);
		}
		return true;
	}
}
