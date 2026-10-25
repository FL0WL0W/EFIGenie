#include "Operations/OperationFactory.h"
#include "GeneratorMap.h"
#include "ServiceRegistry.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/AbstractOperation.h"
#include "CRC.h"
#include "Config.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace EFIGenie
{
	template<OperationArchitecture::OperationFactory *operationFactory, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap, EmbeddedIOOperations::ServiceRegistry *serviceRegistry>
	class EngineMain
	{
		protected:
		static constexpr auto _factoryEntries = OperationArchitecture::CombineEntries(
			OperationArchitecture::RegisterOperationArchitecture<10000, operationFactory, variableMap>(),
			EmbeddedIOOperations::RegisterEmbeddedIOOperationFactory<20000, operationFactory, serviceRegistry>(),
			ReluctorOperations::RegisterReluctorOperationFactory<30000>(),
			RegisterEngineOperationFactory<40000, operationFactory, serviceRegistry>()
		);

		OperationArchitecture::AbstractOperation *_inputsExecute = nullptr;
		OperationArchitecture::AbstractOperation *_preSyncExecute = nullptr;
		OperationArchitecture::AbstractOperation *_syncCondition = nullptr;
		OperationArchitecture::AbstractOperation *_mainLoopExecute = nullptr;
		bool _syncedOnce = false;
		
		public:
		void Start(const void *config, size_t &sizeOut)
		{
			const uint32_t configSize = *reinterpret_cast<const uint32_t *>(config) + sizeof(uint32_t);
			if(configSize == 0 || configSize > 100000)
				return;

			const uint32_t configCRC = EmbeddedIOServices::CRC::CRC32(config, configSize);
			const uint32_t expectedCRC = *reinterpret_cast<const uint32_t *>(reinterpret_cast<const uint8_t *>(config) + configSize);
			if(expectedCRC != configCRC)
			{
				return;
			}
			sizeOut = 0;
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
				if(sizeOut > configSize)
					return;
			}
			while(size > 0);

			size = 0;
			_inputsExecute = operationFactory->Create(config, size);
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);
			if(sizeOut > configSize)
				return;

			size = 0;
			_preSyncExecute = operationFactory->Create(config, size);
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);
			if(sizeOut > configSize)
				return;

			size = 0;
			_syncCondition = operationFactory->Create(config, size);
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);
			if(sizeOut > configSize)
				return;

			size = 0;
			_mainLoopExecute = operationFactory->Create(config, size);
			OperationArchitecture::Config::OffsetConfig(config, sizeOut, size);
			if(sizeOut > configSize)
				return;

			OperationArchitecture::Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));//CRC

			if(_inputsExecute != nullptr) _inputsExecute->Execute();
			if(_preSyncExecute != nullptr) _preSyncExecute->Execute();
		}
		void Stop()
		{
			delete _inputsExecute;
			_inputsExecute = nullptr;
			delete _preSyncExecute;
			_preSyncExecute = nullptr;
			delete _syncCondition;
			_syncCondition = nullptr;
			delete _mainLoopExecute;
			_mainLoopExecute = nullptr;
			_syncedOnce = false;
			operationFactory->Clear();
		}
		void Loop()
		{
			if(_inputsExecute != nullptr) _inputsExecute->Execute();
			if(!_syncedOnce && _syncCondition != nullptr)
				_syncedOnce = _syncCondition->Execute<bool>();
			if(_syncedOnce && _mainLoopExecute != nullptr)
			{
				_mainLoopExecute->Execute();
			}
		}
	};
}
#endif