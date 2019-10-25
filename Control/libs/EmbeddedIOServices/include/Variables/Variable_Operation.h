#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/EmbeddedOperationsRegister.h"
#include "Service/EmbeddedVariablesRegister.h"
#include "Variables/IVariable.h"
#include "Operations/IOperation.h"
#include "stdint.h"
#include "Packed.h"
#include "Interpolation.h"
#include <tuple>

/*
To use this variable refer to the operations header
*/

#define VARIABLE_OPERATION_H
namespace Variables
{
    template<typename RET, typename... PARAMS>
	class Variable_Operation : public IVariable
	{
	protected:
		Operations::IOperation<RET, PARAMS...> *_operation;
		RET *_variable;
		std::tuple<PARAMS*...> _params;

		template<std::size_t... Is>
		RET ExecuteWithTuplePointers(const std::tuple<PARAMS*...>& tuple,
			std::index_sequence<Is...>) {
			return _operation->Execute(*reinterpret_cast<PARAMS*>(std::get<Is>(tuple))...);
		}
	public:		
        Variable_Operation(Operations::IOperation<RET, PARAMS...> *operation, RET *variable, PARAMS*... params)
		{
			_operation = operation;
			_variable = variable;
			_params = std::tuple<PARAMS*...>(params...);
		}

		void TranslateValue() override
		{
			*_variable = ExecuteWithTuplePointers(_params, std::index_sequence_for<PARAMS...>());
		}

		static IVariable *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
		{
			uint32_t variableId = Service::IService::CastAndOffset<uint16_t>(config, sizeOut);
			
			RET *variable = GetOrCreateVariable<RET>(serviceLocator, variableId);

			Operations::IOperation<RET, PARAMS...> *operation = serviceLocator->LocateAndCast<Operations::IOperation<RET, PARAMS...>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
			
			return new Variable_Operation<RET, PARAMS...>(operation, variable, GetOrCreateVariable<PARAMS>(serviceLocator, Service::IService::CastAndOffset<uint16_t>(config, sizeOut))...);
		}
		ISERVICE_REGISTERFACTORY_H_TEMPLATE
	};

	template<typename... PARAMS>
	class Variable_Operation<void, PARAMS...> : public IVariable
	{
	protected:
		Operations::IOperation<void, PARAMS...> *_operation;
		std::tuple<PARAMS*...> _params;

		template<std::size_t... Is>
		void ExecuteWithTuplePointers(const std::tuple<PARAMS*...>& tuple,
			std::index_sequence<Is...>) {
			_operation->Execute(*reinterpret_cast<PARAMS*>(std::get<Is>(tuple))...);
		}
	public:		
        Variable_Operation(Operations::IOperation<void, PARAMS...> *operation, PARAMS*... params)
		{
			_operation = operation;
			_params = std::tuple<PARAMS*...>(params...);
		}

		void TranslateValue() override
		{
			ExecuteWithTuplePointers(_params, std::index_sequence_for<PARAMS...>());
		}

		static IVariable *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
		{
			Operations::IOperation<void, PARAMS...> *operation = serviceLocator->LocateAndCast<Operations::IOperation<void, PARAMS...>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
			
			return new Variable_Operation<void, PARAMS...>(operation, GetOrCreateVariable<PARAMS>(serviceLocator, Service::IService::CastAndOffset<uint16_t>(config, sizeOut))...);
		}
		ISERVICE_REGISTERFACTORY_H_TEMPLATE
	};
}
