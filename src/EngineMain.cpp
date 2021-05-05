#include "EngineMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Config.h"

using namespace OperationArchitecture;

namespace Engine
{
    EngineMain::EngineMain(const void *config, unsigned int &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection)
    {
        _systemBus = new SystemBus();

        OperationFactory *operationFactory = new OperationFactory();
        OperationPackager *packager = new OperationPackager(operationFactory, _systemBus);

        OperationFactoryRegister::Register(10000, operationFactory);
        EmbeddedIOOperationFactoryRegister::Register(20000, operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, operationFactory);
        EngineOperationFactoryRegister::Register(40000, operationFactory, embeddedIOServiceCollection, packager);

        unsigned int size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            _systemBus->Operations.insert(std::pair<uint32_t, IOperationBase*>(operationId, packager->Package(config, size)));
            Config::OffsetConfig(config, sizeOut, size);
        }
        while(size > 0);

        size = 0;
        _inputsExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _preSyncExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _syncCondition = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        _mainLoopExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        delete packager;
        delete operationFactory;
    }

    void EngineMain::Setup()
    {
        _inputsExecute->Execute();
        _preSyncExecute->Execute();
    }

    void EngineMain::Loop()
    {
        _inputsExecute->Execute();
        if(_syncCondition->Execute<bool>())
        {
            _mainLoopExecute->Execute();
        }
    }
}