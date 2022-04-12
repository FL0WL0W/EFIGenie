#include "EFIGenieMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Config.h"

using namespace OperationArchitecture;
using namespace EmbeddedIOServices;
using namespace EmbeddedIOOperations;
using namespace ReluctorOperations;

namespace EFIGenie
{
    EFIGenieMain::EFIGenieMain(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection)
    {
        VariableMap = new OperationArchitecture::GeneratorMap<Variable>();

        OperationFactory *operationFactory = new OperationFactory();

        OperationFactoryRegister::Register(10000, operationFactory, VariableMap);
        EmbeddedIOOperationFactoryRegister::Register(20000, operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, operationFactory);
        EngineOperationFactoryRegister::Register(40000, operationFactory, embeddedIOServiceCollection);

        size_t size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            IOperationBase *operation = operationFactory->Create(config, size);
            operationFactory->Register(operationId, operation);
            Config::OffsetConfig(config, sizeOut, size);
        }
        while(size > 0);

        _inputsExecute = operationFactory->Create(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _preSyncExecute = operationFactory->Create(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _syncCondition = operationFactory->Create(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _mainLoopExecute = operationFactory->Create(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        delete operationFactory;
    }

    void EFIGenieMain::Setup()
    {
        _inputsExecute->Execute();
        _preSyncExecute->Execute();
    }

    void EFIGenieMain::Loop()
    {
        _inputsExecute->Execute();
        if(!_syncedOnce)
            _syncedOnce = _syncCondition->Execute<bool>();
        if(_syncedOnce)
        {
            _mainLoopExecute->Execute();
        }
    }
}