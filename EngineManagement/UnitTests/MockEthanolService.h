namespace EngineManagement
{
	class MockEthanolService : public IEthanolService
	{
	public:
		MOCK_METHOD0(ReadEthanolContent, void());
	};
}