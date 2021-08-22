#include "EngineMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Config.h"

using namespace OperationArchitecture;
using namespace EmbeddedIOServices;

namespace Engine
{
    EngineMain::EngineMain(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection)
    {
        SystemBus = new OperationArchitecture::SystemBus();

        OperationFactory *operationFactory = new OperationFactory();
        OperationPackager *packager = new OperationPackager(operationFactory, SystemBus);

        OperationFactoryRegister::Register(10000, operationFactory);
        EmbeddedIOOperationFactoryRegister::Register(20000, operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, operationFactory);
        EngineOperationFactoryRegister::Register(40000, operationFactory, embeddedIOServiceCollection, packager);

        size_t size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            SystemBus->Operations.insert(std::pair<uint32_t, IOperationBase*>(operationId, packager->Package(config, size)));
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
        if(!_syncedOnce)
            _syncedOnce = _syncCondition->Execute<bool>();
        if(_syncedOnce)
        {
            _mainLoopExecute->Execute();
        }
    }
}