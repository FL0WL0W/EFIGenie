#include "Operations/AbstractOperation.h"
#include "Operations/Operation_EnginePosition.h"
#include <tuple>

#ifndef OPERATION_ENGINEPARAMETERS_H
#define OPERATION_ENGINEPARAMETERS_H
namespace EFIGenie
{
	class Operation_EngineParameters : public OperationArchitecture::Operation<std::tuple<float, bool, bool>, EnginePosition>
	{
	protected:
		volatile bool _sequential;
		volatile bool _synced;
	public:		
		std::tuple<float, bool, bool> Execute(EnginePosition enginePosition) override;
	};
}
#endif