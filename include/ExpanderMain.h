#include "Operations/OperationFactory.h"
#include "GeneratorMap.h"
#include "ServiceRegistry.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/AbstractOperation.h"
#include "CRC.h"
#include "Config.h"

#ifndef EXPANDERMAIN_H
#define EXPANDERMAIN_H
namespace EFIGenie
{
	template<OperationArchitecture::OperationFactory *operationFactory, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap, EmbeddedIOOperations::ServiceRegistry *serviceRegistry>
	class ExpanderMain
	{
		protected:
		static constexpr auto _factoryEntries = OperationArchitecture::CombineEntries(
			OperationArchitecture::RegisterOperationArchitecture<10000, operationFactory, variableMap>(),
			EmbeddedIOOperations::RegisterEmbeddedIOOperationFactory<20000, operationFactory, serviceRegistry>(),
			ReluctorOperations::RegisterReluctorOperationFactory<30000>()
		);

		OperationArchitecture::AbstractOperation *_mainLoopExecute = nullptr;

		public:
		void Start(const void *config, size_t &sizeOut)
		{
			const uint32_t configSize = *reinterpret_cast<const uint32_t *>(config) + sizeof(uint32_t);
			if(configSize == 0 || configSize > 100000)
				return;

			const uint32_t configCRC = EmbeddedIOServices::CRC::CRC32(config, configSize);
			if(*reinterpret_cast<const uint32_t *>(reinterpret_cast<const uint8_t *>(config) + configSize) != configCRC)
			{
				return;
			}
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));

			operationFactory->Register(_factoryEntries.data(), _factoryEntries.size());

			size_t size = 0;
			do
			{
				size = 0;
				const uint32_t operationId = OperationArchitecture::Config::CastAndOffset<uint32_t>(config, sizeOut);
				if(operationId == 0)
					break;
				OperationArchitecture::AbstractOperation *operation = operationFactory->Create(config, size);
				operationFactory->Register(operationId, operation);
				OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);
			}
			while(size > 0);

			size = 0;
			_mainLoopExecute = operationFactory->Create(config, size);
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);

			OperationArchitecture::Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));//CRC
		}
		void Stop()
		{
			delete _mainLoopExecute;
			_mainLoopExecute = nullptr;
			operationFactory->Clear();
		}
		void Loop()
		{
			if(_mainLoopExecute != nullptr)
				_mainLoopExecute->Execute();
		}
	};
}
#endif