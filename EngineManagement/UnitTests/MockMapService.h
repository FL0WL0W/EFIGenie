namespace EngineManagement
{
	class MockMapService : public IMapService
	{
	public:
		MOCK_METHOD0(ReadMap, void());
	};
}